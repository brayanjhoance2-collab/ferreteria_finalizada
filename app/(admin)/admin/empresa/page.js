// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Empresa from "@/_Pages/admin/empresa/empresa";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Empresa></Empresa>
      </ClienteWrapper>
    </div>
  );
}
