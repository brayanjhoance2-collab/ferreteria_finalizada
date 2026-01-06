// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AdminServicioTecnico from "@/_Pages/admin/pagina/servicio/servicio";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AdminServicioTecnico></AdminServicioTecnico>
      </ClienteWrapper>
    </div>
  );
}
