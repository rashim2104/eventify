import puppeteer from "puppeteer";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

async function waitForNetworkIdle(page, timeout = 30000) {
  try {
    await page.waitForNetworkIdle({ 
      idleTime: 500,
      timeout: timeout 
    });
  } catch (err) {
    console.warn('Network idle timeout:', err);
    // Continue anyway as this is not critical
  }
}

export async function POST(req) {
  const ACTION = "Generate PDF";
  let user;
  let browser = null;
  let page = null;

  try {
    user = await authenticate(req);
  } catch (error) {
    await logger(
      "UNKNOWN",
      ACTION,
      "Authentication Failed: " + error.message,
      401
    );
    return new Response(
      JSON.stringify({ message: "Authentication failed" }),
      { status: 401 }
    );
  }

  try {
    await connectMongoDB();
    const { eventId } = await req.json();
    const eventData = await Events.findOne({ _id: eventId });

    if (!eventData) {
      await logger(
        user._id,
        ACTION,
        `Event Not Found: ${eventId}`,
        404
      );
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404 }
      );
    }

    // Platform-specific browser configuration
    const isLinux = process.platform === 'linux';
    const browserOptions = {
      headless: "new",
      pipe: true, // Use pipe instead of WebSocket
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-zygote',
        '--single-process',
        '--disable-accelerated-2d-canvas'
      ]
    };

    if (isLinux) {
      browserOptions.executablePath = '/usr/bin/google-chrome';
    }

    // Launch browser with connection retry
    browser = await puppeteer.launch(browserOptions);
    
    // Create new page with explicit wait
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    
    // Set content with retry mechanism
    const htmlContent = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 20px;
              font-size: 11pt;
              color: #2c3e50;
              line-height: 1.4;
            }

            h1, h2, h3 {
              color: #2c3e50;
              margin: 12px 0 8px 0;
            }

            h1 {
              font-size: 16pt;
              text-align: center;
              margin-top: 20px;
            }

            h2 {
              font-size: 13pt;
              color: #34495e;
              border-bottom: 1px solid #bdc3c7;
              padding-bottom: 4px;
              margin-top: 16px;
            }

            h3 {
              font-size: 12pt;
              margin: 8px 0 4px 0;
            }

            p {
              margin: 4px 0;
            }

            ul {
              margin: 4px 0;
              padding-left: 20px;
            }

            li {
              margin: 2px 0;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
            }

            .header img {
              max-width: 300px;
              height: auto;
            }

            .section-title {
              font-weight: 500;
              color: #2c3e50;
            }

            .event-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 12px;
            }

            .event-info p {
              margin: 4px 0;
            }

            .coordinator-grid, .resource-person-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin: 8px 0;
            }

            .coordinator-item, .resource-person-item {
              border: 1px solid #eee;
              padding: 8px;
              border-radius: 4px;
              margin-bottom: 8px;
            }

            .image-container {
              text-align: center;
              margin: 12px 0;
            }

            .image-container img {
              max-width: 400px;
              max-height: 200px;
              object-fit: contain;
              border: 1px solid #eee;
              border-radius: 4px;
            }

            .footer {
              margin-top: 20px;
              padding: 8px;
              text-align: right;
              font-size: 9pt;
              color: #95a5a6;
              border-top: 1px solid #eee;
            }

            .info-row {
              margin: 4px 0;
            }

            .divider {
              margin: 12px 0;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img 
              src="${eventData.college === "SIT"
                ? "https://eventifys3.s3.ap-south-1.amazonaws.com/SIT+WORDING+1.png"
                : eventData.college === "SEC"
                  ? "https://eventifys3.s3.ap-south-1.amazonaws.com/SEC+LOGO.png"
                  : "https://eventifys3.s3.ap-south-1.amazonaws.com/SEC+and+SIT+WORDING+1.png"}"
              alt="Header Logo"
            />
          </div>

          <h1>Event Report: ${eventData.eventData.EventName}</h1>

          <div class="event-info">
            <div class="info-row">
              <span class="section-title">Event ID:</span> ${eventData.ins_id || 'N/A'}
            </div>
            <div class="info-row">
              <span class="section-title">Department:</span> ${eventData.dept}
            </div>
            <div class="info-row">
              <span class="section-title">Venue:</span> ${eventData.eventData.EventVenue}
            </div>
            <div class="info-row">
              <span class="section-title">Duration:</span> ${eventData.eventData.EventDuration} hours
            </div>
            <div class="info-row">
              <span class="section-title">Start:</span> ${new Date(eventData.eventData.StartTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </div>
            <div class="info-row">
              <span class="section-title">End:</span> ${new Date(eventData.eventData.EndTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </div>
          </div>

          <h2>Event Objective</h2>
          <p>${eventData.eventData.EventObjective}</p>

          <h2>Stakeholders</h2>
          <ul>
            ${eventData.eventData.eventStakeholders
              ? eventData.eventData.eventStakeholders
                .map((stakeholder) => `<li>${stakeholder}</li>`)
                .join("")
              : "<li>N/A</li>"
            }
          </ul>

          <h2>Event Coordinators</h2>
          <div class="coordinator-grid">
            ${eventData.eventData.eventCoordinators
              ? eventData.eventData.eventCoordinators
                .map(
                  (coordinator) => `
                    <div class="coordinator-item">
                      <p><strong>${coordinator.coordinatorName}</strong> (${coordinator.coordinatorRole})</p>
                      <p>${coordinator.coordinatorMail}</p>
                      <p>${coordinator.coordinatorPhone}</p>
                    </div>
                  `
                )
                .join("")
              : "<p>N/A</p>"
            }
          </div>

          ${eventData.eventData.eventResourcePerson && eventData.eventData.eventResourcePerson.length > 0 
            ? `
              <h2>Resource Persons</h2>
              <div class="resource-person-grid">
                ${eventData.eventData.eventResourcePerson
                  .map(
                    (person) => `
                      <div class="resource-person-item">
                        <p><strong>${person.ResourcePersonName}</strong> (${person.ResourcePersonDesgn})</p>
                        <p>${person.ResourcePersonMail}</p>
                        <p>${person.ResourcePersonPhone}</p>
                        <p>${person.ResourcePersonAddr}</p>
                      </div>
                    `
                  )
                  .join("")
                }
              </div>
            `
            : ''
          }

          ${eventData.eventData.Budget 
            ? `
              <h2>Budget Information</h2>
              <p><span class="section-title">Budget:</span> ₹${eventData.eventData.Budget}</p>
            `
            : ''
          }

          ${eventData.eventData.fileUrl.poster 
            ? `
              <h2>Event Poster</h2>
              <div class="image-container">
                ${/\.(png|jpe?g)$/i.test(eventData.eventData.fileUrl.poster)
                  ? `<img src="${eventData.eventData.fileUrl.poster}" alt="Event Poster"/>`
                  : `<a href="${eventData.eventData.fileUrl.poster}" target="_blank">View Poster</a>`
                }
              </div>
            `
            : ''
          }

          ${eventData.postEventData
            ? `
              <h2>Post Event Documentation</h2>
              ${eventData.postEventData.fileUrl?.geoPhotos && eventData.postEventData.fileUrl.geoPhotos.length > 0
                ? `
                  <h3>Event Photos</h3>
                  <div class="image-container">
                    ${eventData.postEventData.fileUrl.geoPhotos
                      .map(photoUrl => `<img src="${photoUrl}" alt="Event Photo"/>`)
                      .join("")
                    }
                  </div>
                `
                : ''
              }
              ${eventData.postEventData.fileUrl?.report
                ? `<p><strong>Report:</strong> <a href="${eventData.postEventData.fileUrl.report}" target="_blank">View Report</a></p>`
                : ''
              }
              ${eventData.postEventData.fileUrl?.financialCommitments
                ? `<p><strong>Financial Documents:</strong> <a href="${eventData.postEventData.fileUrl.financialCommitments}" target="_blank">View Documents</a></p>`
                : ''
              }
            `
            : ''
          }

          <div class="footer">
            Generated by Eventify • ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        </body>
      </html>
    `;

    let loaded = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!loaded && attempts < maxAttempts) {
      try {
        await page.setContent(htmlContent, {
          waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
          timeout: 30000
        });
        
        // Wait for any remaining network activity to settle
        await waitForNetworkIdle(page);
        
        // Ensure all images are loaded
        await page.evaluate(async () => {
          const selectors = Array.from(document.getElementsByTagName('img'));
          await Promise.all(selectors.map(img => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve); // Don't reject on error
            });
          }));
        });

        loaded = true;
      } catch (err) {
        attempts++;
        console.warn(`Page load attempt ${attempts} failed:`, err);
        if (attempts === maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Generate PDF with explicit wait
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 8px; padding: 0 20px; color: #666; display: flex; justify-content: flex-end;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      timeout: 60000 // Increase timeout for PDF generation
    });

    // Close browser after successful PDF generation
    if (page) await page.close();
    if (browser) await browser.close();

    await logger(
      user._id,
      ACTION,
      `PDF Generated Successfully - Event: ${eventData.eventData.EventName}`,
      200
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${eventData.eventData.EventName}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    await logger(
      user?._id || "UNKNOWN",
      ACTION,
      "PDF Generation Failed: " + error.message,
      500
    );
    
    // Cleanup resources in case of error
    try {
      if (page) await page.close();
      if (browser) await browser.close();
    } catch (closeError) {
      console.error('Error during cleanup:', closeError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Error generating PDF",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}