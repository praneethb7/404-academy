export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, name, userType } = req.body;

        const sendGridEndpoint = "https://api.sendgrid.com/v3/mail/send";
        const apiKey = process.env.SENDGRID_API_KEY;

        const emailContent = {
            personalizations: [
                {
                    to: [{ email: email }],
                    subject: "Welcome to 404 Academy!",
                },
            ],
            from: {
                email: "praneeth.24bcs10081@sst.scaler.com",
                name: "404 Academy",
            },
            content: [
                {
                    type: "text/html",
                    value: `
                        <h1>Welcome, ${name}!</h1>
                        <p>Thank you for signing up as ${userType} at 404 Academy.</p>
                        <p>We’re thrilled to have you here and can't wait for you to explore our platform!</p>
                    `,
                },
            ],
        };

        try {
            const response = await fetch(sendGridEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(emailContent),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error sending email:", errorText);
                return res.status(500).json({ error: "Failed to send email" });
            }

            return res.status(200).json({ message: "Email sent successfully" });
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
