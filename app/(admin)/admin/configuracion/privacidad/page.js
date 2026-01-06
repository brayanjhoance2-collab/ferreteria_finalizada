// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Privacidad from "@/_Pages/admin/configuracion/privacidad/privacidad";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Privacidad></Privacidad>
      </ClienteWrapper>
    </div>
  );
}
