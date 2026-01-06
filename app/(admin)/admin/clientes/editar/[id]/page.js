// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import EditarCliente from "@/_Pages/admin/clientes/editar/editar";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <EditarCliente></EditarCliente>
      </ClienteWrapper>
    </div>
  );
}
