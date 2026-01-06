// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AdminArriendoEquipos from "@/_Pages/admin/pagina/tendidos/tendidos";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AdminArriendoEquipos></AdminArriendoEquipos>
      </ClienteWrapper>
    </div>
  );
}
