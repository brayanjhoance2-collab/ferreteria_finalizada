// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AdminSobreNosotros from "@/_Pages/admin/pagina/sobrenosotros/nosotros";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AdminSobreNosotros></AdminSobreNosotros>
      </ClienteWrapper>
    </div>
  );
}
