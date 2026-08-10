import { dbGetUsersWithMeta } from "@/lib/db-actions"
import { ConfiguracionClient } from "./ConfiguracionClient"

export default async function ConfiguracionPage() {
  const { users, canManage } = await dbGetUsersWithMeta()
  return <ConfiguracionClient initialUsers={users} canManage={canManage} />
}
