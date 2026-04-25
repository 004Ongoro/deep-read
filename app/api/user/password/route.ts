import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: "Invalid passwords. New password must be at least 6 characters." }, { status: 400 });
    }

    await connectToDatabase();

    interface AuthUser {
      id: string;
      email: string;
      name?: string;
    }

    const user = session.user as AuthUser;
    const dbUser = await User.findById(user.id);

    if (!dbUser || !dbUser.password) {
      return NextResponse.json({ message: "User not found or no password set" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect current password" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    dbUser.password = hashedPassword;
    await dbUser.save();

    // Send confirmation email via Zoho SMTP
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.zoho.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Deep Read Security" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Security Alert: Your password was changed",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Password Changed Successfully</h2>
              <p>Hi ${user.name || "Reader"},</p>
              <p>Your password for your Deep Read account was recently changed.</p>
              <p>If you did not authorize this change, please contact us immediately.</p>
              <br/>
              <p>The Deep Read Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // We still return 200 since the password WAS changed
      }
    }

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Password Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
