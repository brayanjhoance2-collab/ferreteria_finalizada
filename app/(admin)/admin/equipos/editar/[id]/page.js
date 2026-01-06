// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";

import EditarEquipo from "@/_Pages/admin/equipos/editar/editar";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <EditarEquipo></EditarEquipo>
      </ClienteWrapper>
    </div>
  );
}
