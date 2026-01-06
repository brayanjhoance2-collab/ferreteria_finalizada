// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import ListaEquipos from "@/_Pages/admin/equipos/lista/lista";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <ListaEquipos></ListaEquipos>
      </ClienteWrapper>
    </div>
  );
}
