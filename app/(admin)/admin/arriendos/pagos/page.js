// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Pagos from "@/_Pages/admin/arriendos/pagos/pagos";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Pagos></Pagos>
      </ClienteWrapper>
    </div>
  );
}
