// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Home from "@/_Pages/main/home/home";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Home></Home>
      </ClienteWrapper>
    </div>
  );
}
