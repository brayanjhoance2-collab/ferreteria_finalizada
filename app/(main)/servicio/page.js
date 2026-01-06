// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Servicios from "@/_Pages/main/servicios/servicios";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Servicios></Servicios>
      </ClienteWrapper>
    </div>
  );
}
