// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import MiPerfil from "@/_Pages/admin/perfil/perfil";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <MiPerfil></MiPerfil>
      </ClienteWrapper>
    </div>
  );
}
