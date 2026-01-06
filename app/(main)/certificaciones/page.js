// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Certificaciones from "@/_Pages/main/certificaciones/certificaciones";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Certificaciones></Certificaciones>
      </ClienteWrapper>
    </div>
  );
}
