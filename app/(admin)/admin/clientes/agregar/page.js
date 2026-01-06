// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AgregarCliente from "@/_Pages/admin/clientes/agregar/agregar";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AgregarCliente></AgregarCliente>
      </ClienteWrapper>
    </div>
  );
}
