// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Contacto from "@/_Pages/admin/contacto/contacto";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <Contacto></Contacto>
      </ClienteWrapper>
    </div>
  );
}
