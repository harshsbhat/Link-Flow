import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PageButtonsForm from "@/components/forms/PageButtonsForm";
import PageLinksForm from "@/components/forms/PageLinksForm";
import PageSettingsForm from "@/components/forms/PageSettingsForm";
import UsernameForm from "@/components/forms/UsernameForm";
import { Page } from "@/models/Page";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import cloneDeep from 'clone-deep';

// Establish Mongoose connection
mongoose.connect(process.env.MONGO_URI);

export default async function AccountPage({ searchParams }) {
  try {
    const session = await getServerSession(authOptions);
    const desiredUsername = searchParams?.desiredUsername;

    if (!session) {
      return redirect('/');
    }

    // Retrieve page associated with user
    const page = await Page.findOne({ owner: session?.user?.email });

    if (page) {
      // Clone page object to avoid mutating the original
      const leanPage = cloneDeep(page.toJSON());
      leanPage._id = leanPage._id.toString();

      // Render forms for existing page
      return (
        <>
          <PageSettingsForm page={leanPage} user={session.user} />
          <PageLinksForm page={leanPage} user={session.user} />
        </>
      );
    } else {
      // Render form for creating a new page
      return (
        <div>
          <UsernameForm desiredUsername={desiredUsername} />
        </div>
      );
    }
  } catch (error) {
    // Handle any errors
    console.error("Error in AccountPage:", error);
    return <div>Oops! Something went wrong.</div>;
  }
}
