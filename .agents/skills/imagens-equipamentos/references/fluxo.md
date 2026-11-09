# Seleção e entrega

Use PowerShell 7 no Windows. A transformação usa System.Drawing do Windows.
Consulte a [API do Pixabay](https://pixabay.com/api/docs/) e a
[licença](https://pixabay.com/service/license-summary/). A chave fica no ambiente local do
operador e o script envia a chave exclusivamente à API.

Execute a partir da raiz e use uma pasta fora do repositório:

```powershell
$script = '.agents/skills/imagens-equipamentos/scripts/Prepare-Photos.ps1'
& $script -OutputDirectory "$env:TEMP/empres-ti-fotos" -Search
```

As respostas da API ficam em cache local por 24 horas. O modo de busca
escreve candidatos locais por patrimônio com metadados e URLs
do CDN do Pixabay. Use as URLs para revisão visual. Anote os rejeitados com
patrimônio, ID e motivo. O arquivo de seleção é um objeto JSON em que cada
chave TI-0001 a TI-0012 aponta para o ID numérico de uma foto revisada. IDs
que não apareceram na busca inicial podem ser consultados pela mesma API.

```powershell
& $script -OutputDirectory "$env:TEMP/empres-ti-fotos" -SelectionPath 'C:/caminho/selecao.json'
```

O script usa recorte central proporcional e valida o tamanho do JPEG salvo.
O manifesto registra patrimônio, ID, página da foto, URL de origem,
fotógrafo, licença, dimensões, SHA-256 e destino estável. A repetição com os
mesmos JPEGs e manifesto não altera o lote. Revise o recorte final e marque
a aprovação separadamente, com data e hash. Se um recorte reprovar, substitua
a foto e repita a revisão.

O operador recebe somente os JPEGs aprovados e o manifesto. No bucket público,
use a chave de objeto do manifesto. Em reexecuções, compare o hash ou substitua
o mesmo objeto. Abra cada URL pública sem sessão e confira a foto, o tamanho
e a correspondência com o patrimônio. A revisão visual e a operação do Storage
são responsabilidades humanas separadas das validações do script.
