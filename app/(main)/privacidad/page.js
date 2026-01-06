// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Terminos from "@/_Pages/main/terminos/terminos";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Terminos></Terminos>
      </ClienteWrapper>
    </div>
  );
}
