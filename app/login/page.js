// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Login from "@/_Pages/admin/login/login";
import CrearSuperAdminInicial from "@/_EXTRAS/Crear/crear";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <CrearSuperAdminInicial></CrearSuperAdminInicial>
        <Login></Login>
      </ClienteWrapper>
    </div>
  );
}
