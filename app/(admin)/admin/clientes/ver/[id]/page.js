// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import VerCliente from "@/_Pages/admin/clientes/ver/ver";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <VerCliente></VerCliente>
      </ClienteWrapper>
    </div>
  );
}
