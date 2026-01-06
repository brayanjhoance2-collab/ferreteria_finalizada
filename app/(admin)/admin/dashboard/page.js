// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Dashboard from "@/_Pages/admin/dashboard/dashboard";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Dashboard></Dashboard>
      </ClienteWrapper>
    </div>
  );
}
