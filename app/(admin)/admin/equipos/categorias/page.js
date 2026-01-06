// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Categorias from "@/_Pages/admin/categorias/categorias";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Categorias></Categorias>
      </ClienteWrapper>
    </div>
  );
}
