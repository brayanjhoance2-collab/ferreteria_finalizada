// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import ListaClientes from "@/_Pages/admin/clientes/lista/lista";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <ListaClientes></ListaClientes>
      </ClienteWrapper>
    </div>
  );
}
