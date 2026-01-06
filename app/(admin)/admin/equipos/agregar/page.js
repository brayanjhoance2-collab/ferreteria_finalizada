// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import AgregarEquipo from "@/_Pages/admin/equipos/agregar/agregar";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <AgregarEquipo></AgregarEquipo>
      </ClienteWrapper>
    </div>
  );
}
