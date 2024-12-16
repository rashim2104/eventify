import puppeteer from "puppeteer";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";

export async function POST(req) {
  try {
    // Get the incoming data (eventId)
    const { eventId } = await req.json();

    // Fetch event data from MongoDB
    const eventData = await Events.findOne({ _id: eventId });

    if (!eventData) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const browser = await puppeteer.launch({
      headless: "new", // Headless mode
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Useful for production
    });

    const page = await browser.newPage();

    // Render HTML content to generate PDF (Using eventData)
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 5%;
              font-size: 24px;
            }

            h1 {
              color: #2c3e50;
              font-size: 24px;
            }

            p {
              color: #34495e;
              font-size: 24px;
            }

            .section-title {
              font-weight: bold;
              font-size: 24px;
            }

            .footer {
              padding: 20px;
              position: fixed;
              bottom: 0;
              right: 0;
              width: 100%;
              text-align: right;
              font-size: 20px;
              color: #aaa;
            }

            .event-info,
            .stakeholder-info,
            .budget-info {
              margin-bottom: 20px;
            }

            .image-container img {
              max-width: 90%;
              height: auto;
              margin: 10px 0;
            }

            .header {
              margin-bottom: 50px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img 
              src="${
                eventData.college === "SIT"
                  ? "https://eventifys3.s3.ap-south-1.amazonaws.com/SIT+WORDING+1.png"
                  : eventData.college === "SEC"
                  ? "https://eventifys3.s3.ap-south-1.amazonaws.com/SEC+WORDING+1.png"
                  : "https://eventifys3.s3.ap-south-1.amazonaws.com/SEC+and+SIT+WORDING+1.png"
              }" 
              alt="Header Image" 
              style="width: 90vW; height: auto;" 
            />
          </div>
          <h1 style="text-align: center;">Event Report - ${eventData.ins_id} - ${eventData.eventData.EventName}</h1>

          <!-- Event Information -->
          <div class="event-info">
            <p><span class="section-title">Event Name:</span> ${eventData.eventData.EventName}</p>
            <p><span class="section-title">Event Objective:</span> ${eventData.eventData.EventObjective}</p>
            <p><span class="section-title">Event Venue:</span> ${eventData.eventData.EventVenue}</p>
            <p><span class="section-title">Start Time:</span> ${new Date(eventData.eventData.StartTime).toLocaleString()}</p>
            <p><span class="section-title">End Time:</span> ${new Date(eventData.eventData.EndTime).toLocaleString()}</p>
            <p><span class="section-title">Duration:</span> ${eventData.eventData.EventDuration} hours</p>
          </div>

          <!-- Stakeholders -->
          <div class="stakeholder-info">
            <h2>Stakeholders:</h2>
            <ul>
              ${
                eventData.eventData.eventStakeholders
                  ? eventData.eventData.eventStakeholders
                      .map((stakeholder) => `<li>${stakeholder}</li>`)
                      .join("")
                  : "N/A"
              }
            </ul>
          </div>

          <!-- Event Coordinators -->
          <div class="event-coordinators">
            <h2>Event Coordinators:</h2>
            ${
              eventData.eventData.eventCoordinators
                ? eventData.eventData.eventCoordinators
                    .map(
                      (coordinator) => `
                <p><strong>Name:</strong> ${coordinator.coordinatorName}</p>
                <p><strong>Email:</strong> ${coordinator.coordinatorMail}</p>
                <p><strong>Phone:</strong> ${coordinator.coordinatorPhone}</p>
                <p><strong>Role:</strong> ${coordinator.coordinatorRole}</p>
                <hr />
              `
                    )
                    .join("")
                : "N/A"
            }
          </div>

          <!-- Resource Persons -->
          <div class="event-resource-persons">
            <h2>Resource Persons:</h2>
            ${
              eventData.eventData.eventResourcePerson
                ? eventData.eventData.eventResourcePerson
                    .map(
                      (person) => `
                <p><strong>Name:</strong> ${person.ResourcePersonName}</p>
                <p><strong>Email:</strong> ${person.ResourcePersonMail}</p>
                <p><strong>Phone:</strong> ${person.ResourcePersonPhone}</p>
                <p><strong>Designation:</strong> ${person.ResourcePersonDesgn}</p>
                <p><strong>Address:</strong> ${person.ResourcePersonAddr}</p>
                <hr />
              `
                    )
                    .join("")
                : "N/A"
            }
          </div>

          <!-- Budget Info -->
          <div class="budget-info">
            <p><span class="section-title">Budget:</span> ₹${eventData.eventData.Budget || "N/A"}</p>
          </div>

          <!-- Image Links -->
          <div class="image-container">
            <h2>Event Poster:</h2>
            ${
              eventData.eventData.fileUrl.poster
                ? `<img src="${eventData.eventData.fileUrl.poster}" alt="Event Poster"/>`
                : "No poster available"
            }
          </div>

          <!-- Post Event Links -->
          <div class="post-event-info">
            <h2>Post Event Details:</h2>
            ${
              eventData.postEventData?.fileUrl?.geoPhotos
                ? `
                <h3>Geo Photos:</h3>
                ${eventData.postEventData.fileUrl.geoPhotos
                  .map((photoUrl) => `<img src="${photoUrl}" alt="Geo Photo"/>`)
                  .join("")}
              `
                : "No geo photos available"
            }
            <h3>Report:</h3>
            ${
              eventData.postEventData?.fileUrl.report
                ? `<a href="${eventData.postEventData.fileUrl.report}" target="_blank">Download Report</a>`
                : "No report available"
            }
            <h3>Financial Commitments:</h3>
            ${
              eventData.postEventData?.fileUrl.financialCommitments
                ? `<a href="${eventData.postEventData.fileUrl.financialCommitments}" target="_blank">Download Financial Commitments</a>`
                : "No financial documents available"
            }
          </div>

          <div class="footer">
            Generated with Eventify - ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    // Set content for the PDF
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Return the PDF as a response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${eventData.eventData.EventName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(JSON.stringify({ error: "Error generating PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
