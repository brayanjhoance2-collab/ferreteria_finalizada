// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Terminos from "@/_Pages/admin/configuracion/terminos/terminos";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Terminos></Terminos>
      </ClienteWrapper>
    </div>
  );
}
