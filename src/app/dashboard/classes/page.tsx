import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ClassManagementList } from "@/components/trainer/class-management-list";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Classes",
  robots: { index: false, follow: false },
};

export default async function TrainerClassesPage() {
  const authUser = await getServerAuthUser();
  if (!authUser) redirect("/login?redirect=/dashboard/classes");

  const profile = await getProfileRepository().getProfile(authUser.id);

  if (profile?.role !== "trainer") {
    return (
      <PageContainer className="py-16 max-w-lg text-center">
        <h1 className="text-2xl font-display font-medium mb-3">Trainer accounts only</h1>
        <p className="text-white/60 mb-6">
          Class management is available to trainer accounts. If you&apos;d like to teach at Apex, reach
          out to our team to have your account upgraded to a trainer role.
        </p>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Back to dashboard
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-medium mb-2">My Classes</h1>
        <p className="text-white/60">Create, edit, publish, and cancel the classes you teach.</p>
      </div>
      <ClassManagementList />
    </PageContainer>
  );
}
