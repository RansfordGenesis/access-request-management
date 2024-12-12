import { NextResponse } from "next/server";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const dynamodb = DynamoDBDocument.from(
	new DynamoDB({
		region: process.env.AWS_REGION,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
		},
	})
);

const ses = new SESClient({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

export async function POST(
	request: Request,
	context: { params: { id: string } }
) {
	try {
		const { id } = context.params;

		const result = await dynamodb.update({
			TableName: process.env.DYNAMODB_TABLE_NAME!,
			Key: { id },
			UpdateExpression: "SET #status = :status",
			ExpressionAttributeNames: {
				"#status": "status",
			},
			ExpressionAttributeValues: {
				":status": "Rejected",
			},
			ReturnValues: "ALL_NEW",
		});

		const updatedRequest = result.Attributes;

		// Send email to requester
		const emailParams = {
			Destination: {
				ToAddresses: [updatedRequest.email],
			},
			Message: {
				Body: {
					Text: {
						Charset: "UTF-8",
						Data: "Your access request cannot be granted at this time. If you have any questions or need further assistance, please contact the Infrastructure Department.",
					},
				},
				Subject: {
					Charset: "UTF-8",
					Data: "Access Request Rejected",
				},
			},
			Source: process.env.SES_SENDER_EMAIL!,
		};

		await ses.send(new SendEmailCommand(emailParams));

		return NextResponse.json(
			{ message: "Request rejected successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error rejecting request:", error);
		return NextResponse.json(
			{ error: "Failed to reject request" },
			{ status: 500 }
		);
	}
}
