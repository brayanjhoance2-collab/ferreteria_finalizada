// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Auditoria from "@/_Pages/admin/auditoria/auditoria";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Auditoria></Auditoria>
      </ClienteWrapper>
    </div>
  );
}
