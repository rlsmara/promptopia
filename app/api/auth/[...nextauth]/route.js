import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDB } from '@utils/database';
import User from '@models/user';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email
      })
  
      // Updating it to know always know which user is currently online
      session.user.id = sessionUser._id.toString();
  
      return session;
    },
    async signIn({ profile }) {
      try {
        await connectToDB();
  
        // Check if a user already exists
        const userExists = await User.findOne({
          email: profile.email
        });
  
        // If not, create a new user and save to DB
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture
          })
        };
  
        return true;
      } catch (error) {
        console.log("Error: ", error.message);
        return false;
      }
    },
  },
})

export { handler as GET, handler as POST };