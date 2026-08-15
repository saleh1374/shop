import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import AddressBook from "@/components/address-book";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await requireUser();
  const addresses = await db.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <AddressBook
      addresses={addresses.map((a) => ({
        id: a.id,
        title: a.title,
        receiverName: a.receiverName,
        receiverPhone: a.receiverPhone,
        province: a.province,
        city: a.city,
        address: a.address,
        postalCode: a.postalCode ?? "",
        isDefault: a.isDefault,
      }))}
    />
  );
}