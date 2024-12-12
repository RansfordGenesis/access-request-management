import { NextResponse } from "next/server";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamodb = DynamoDBDocument.from(
	new DynamoDB({
		region: process.env.AWS_REGION,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
		},
	})
);

export async function GET() {
	try {
		const result = await dynamodb.scan({
			TableName: process.env.DYNAMODB_TABLE_NAME!,
		});

		return NextResponse.json(result.Items, { status: 200 });
	} catch (error) {
		console.error("Error fetching requests:", error);
		return NextResponse.json(
			{ error: "Failed to fetch requests" },
			{ status: 500 }
		);
	}
}
