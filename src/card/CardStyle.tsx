import styled from 'styled-components';

export const ListWrapper = styled.div`
    max-width: 700px;
    margin: auto;
`
export const ReportItemContainer = styled.div`
   
`;


export const getBorderStyleForDate = (startingDate: number | Date, currentDate: number) => {
    return (startingDate > new Date(currentDate - 8640000 * 5)) ? 'none' : 'none';
}

export const ReportItemContainerWithWarning = styled(ReportItemContainer)`
border-bottom: ${(props: { createdAt: string | number | Date; }) => getBorderStyleForDate(new Date(props.createdAt), Date.now())};
`;

export const ButtonsContainer = styled.div`
position: absolute;
right: 12px;
bottom: 12px;
`;

export const Button = styled.button`
`;

export const CompletedButton = styled(Button)`
`;

export const RemoveButton = styled(Button)`
`;

export const FormContainer = styled.div`
`;

export const NewTodoInput = styled.input`
`;

export const NewTodoButton = styled.button`
cursor: pointer;
`;

export const AppContainer = styled.div`
margin: 0;
font-family: Arial, Helvetica, sans-serif;
color: #222222;
`;