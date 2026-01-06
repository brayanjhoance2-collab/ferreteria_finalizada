// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Nosotros from "@/_Pages/main/nosotros/nosotros";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Nosotros></Nosotros>
      </ClienteWrapper>
    </div>
  );
}
