
// Tipagem básica para os dados do usuário, para melhorar a segurança do tipo.
// Ajuste conforme a estrutura real da sua API.
type UserData = {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    birthDate: string;
    address: string;
    role?: string;
    // ... adicione outros campos conforme necessário
};

// Modificamos a tipagem da função para retornar Promise<UserData | null>
export const useGetSelfInfoAction = () => {

    // A função retornada agora será performGetSelfCallout, pois performGetSelf era redundante.
    async function performGetSelfCallout(): Promise<UserData | null> {
        const url = `${process.env.EXPO_PUBLIC_API_URL}/users/me`;

        const options = {
            method: 'GET',
            credentials: 'include' as RequestCredentials,
            headers: { 'content-type': 'application/json' },
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            // Log e alerta removidos daqui para não atrapalhar o fluxo de UI,
            // mas mantidos se a flag 'DEBUG' for usada.
            console.log("Resposta da API /users/me:", data);
            
            // Retorna os dados em caso de sucesso
            if (response.ok) {
                // Remove o alerta que era chamado aqui para não travar a tela
                // Alerta só é exibido se for para debug
                
                // Força o casting para UserData (já que a resposta é OK)
                return data as UserData; 
            } else {
                // Em caso de erro da API (e.g., 401, 403, 500)
                console.error("Erro ao obter info do usuário:", data);
                // Alert.alert("Erro da API", data.detail || "Erro desconhecido.", [{ text: "OK" }]);
                return null;
            }
        } catch (error) {
            // Em caso de erro de rede (e.g., sem conexão)
            console.error("Erro de rede ao obter info do usuário:", error);
            // Alert.alert("Erro de Rede", "Não foi possível conectar à API.", [{ text: "OK" }]);
            return null;
        }
    }

    // A função retornada é performGetSelfCallout, que agora retorna os dados tipados.
    return performGetSelfCallout;
};

export default function GetSelfInfo() {
    return null;
}