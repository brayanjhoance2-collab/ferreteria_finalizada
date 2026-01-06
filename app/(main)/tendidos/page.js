// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Tendidos from "@/_Pages/main/tendidos/tendidos";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Tendidos></Tendidos>
      </ClienteWrapper>
    </div>
  );
}
