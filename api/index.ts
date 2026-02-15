import app from "../src/app";
import connectToDatabase from "../src/utils/db";

export default async function handler(req: any, res: any) {
    await connectToDatabase();
    return app(req, res);
}
