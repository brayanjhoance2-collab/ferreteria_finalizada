// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AdminCertificaciones from "@/_Pages/admin/pagina/certificaciones/certificaciones";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AdminCertificaciones></AdminCertificaciones>
      </ClienteWrapper>
    </div>
  );
}
