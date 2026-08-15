import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileSettings from "@/components/profile-settings";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return null;

  return <ProfileSettings name={user.name} email={user.email} phone={user.phone} />;
}