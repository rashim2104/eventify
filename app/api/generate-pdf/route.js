import puppeteer from "puppeteer";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";

export async function POST(req) {
  try {
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
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Render HTML content to generate PDF
    const htmlContent = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 5%;
              font-size: 24px;
              color: #2c3e50;
            }

            h1, h2, h3 {
              font-family: 'Merriweather', serif;
              color: #2c3e50;
              margin-bottom: 20px;
            }

            h1 {
              font-size: 32px;
              text-align: center;
            }

            h2 {
              font-size: 28px;
              margin-top: 30px;
            }

            p, li {
              line-height: 1.6;
            }

            ul {
              padding-left: 20px;
            }

            .section-title {
              font-weight: bold;
            }

            .footer {
              padding: 20px;
              position: fixed;
              bottom: 0;
              right: 0;
              width: 100%;
              text-align: right;
              font-size: 18px;
              color: #aaa;
            }

            .event-info, .stakeholder-info, .budget-info, .image-container, .post-event-info {
              margin-bottom: 30px;
            }

            .header img {
              max-width: 100%;
              height: auto;
              margin-bottom: 30px;
            }

            .image-container img {
              max-width: 100%;
              height: auto;
              margin: 10px 0;
              border: 1px solid #ccc;
              border-radius: 5px;
            }

            .divider {
              border-top: 2px solid #ccc;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <!-- Header Image -->
          <div class="header">
            <img 
              src="${
                eventData.college === "SIT"
                  ? "https://eventifys3.s3.ap-south-1.amazonaws.com/SIT+WORDING+1.png"
                  : eventData.college === "SEC"
                  ? "https://eventifys3.s3.ap-south-1.amazonaws.com/SEC+LOGO.png"
                  : "https://eventifys3.s3.ap-south-1.amazonaws.com/SEC+and+SIT+WORDING+1.png"
              }" 
              alt="Header Image" 
            />
          </div>

          <h1>Event Report</h1>
          <h2>${eventData.eventData.EventName}</h2>

          <!-- Event Information -->
          <div class="event-info">
            <h2>Event Details</h2>
            <p><span class="section-title">Objective:</span> ${
              eventData.eventData.EventObjective
            }</p>
            <p><span class="section-title">Venue:</span> ${
              eventData.eventData.EventVenue
            }</p>
            <p><span class="section-title">Start Time:</span> ${new Date(
              eventData.eventData.StartTime
            ).toLocaleString()}</p>
            <p><span class="section-title">End Time:</span> ${new Date(
              eventData.eventData.EndTime
            ).toLocaleString()}</p>
            <p><span class="section-title">Duration:</span> ${
              eventData.eventData.EventDuration
            } hours</p>
          </div>
          <hr class="divider">

          <!-- Stakeholders -->
          <div class="stakeholder-info">
            <h2>Stakeholders</h2>
            <ul>
              ${
                eventData.eventData.eventStakeholders
                  ? eventData.eventData.eventStakeholders
                      .map((stakeholder) => `<li>${stakeholder}</li>`)
                      .join("")
                  : "<p>N/A</p>"
              }
            </ul>
          </div>
          <hr class="divider">

          <!-- Event Coordinators -->
          <div class="event-coordinators">
            <h2>Event Coordinators</h2>
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
                : "<p>N/A</p>"
            }
          </div>
          <hr class="divider">

          <!-- Resource Persons -->
          <div class="event-resource-persons">
            <h2>Resource Persons</h2>
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
                : "<p>N/A</p>"
            }
          </div>
          <hr class="divider">

          <!-- Budget Info -->
          <div class="budget-info">
            <h2>Budget Information</h2>
            <p><span class="section-title">Budget:</span> ₹${
              eventData.eventData.Budget || "N/A"
            }</p>
          </div>
          <hr class="divider">

          <!-- Image Links -->
          <div class="image-container">
            <h2>Event Poster</h2>
            ${
              eventData.eventData.fileUrl.poster
                ? `<img src="${eventData.eventData.fileUrl.poster}" alt="Event Poster"/>`
                : "<p>No poster available</p>"
            }
          </div>
          <hr class="divider">

          <!-- Post Event Links -->
          <div class="post-event-info">
            <h2>Post Event Details</h2>
            ${
              eventData.postEventData?.fileUrl?.geoPhotos
                ? `
              <h3>Geo Photos</h3>
              ${eventData.postEventData.fileUrl.geoPhotos
                .map((photoUrl) => `<img src="${photoUrl}" alt="Geo Photo"/>`)
                .join("")}
              `
                : "<p>No geo photos available</p>"
            }
            ${
              eventData.postEventData?.fileUrl?.report
                ? `<h3>Report:</h3><a href="${eventData.postEventData.fileUrl.report}" target="_blank">Download Report</a>`
                : "<p>No report available</p>"
            }
            ${
              eventData.postEventData?.fileUrl?.financialCommitments
                ? `<h3>Financial Commitments:</h3><a href="${eventData.postEventData.fileUrl.financialCommitments}" target="_blank">Download Financial Commitments</a>`
                : "<p>No financial commitments available</p>"
            }
          </div>

          <div class="footer">
            Generated with Eventify - ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    await browser.close();

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
