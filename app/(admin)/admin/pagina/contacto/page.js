// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AdminContacto from "@/_Pages/admin/pagina/contacto/contacto";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AdminContacto></AdminContacto>
      </ClienteWrapper>
    </div>
  );
}
