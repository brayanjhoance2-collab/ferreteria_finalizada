// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import ListaArriendos from "@/_Pages/admin/arriendos/lista/lista";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <ListaArriendos></ListaArriendos>
      </ClienteWrapper>
    </div>
  );
}
