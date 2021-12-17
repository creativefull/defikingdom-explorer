function fetchDataTable(selector, options) {
	tableTxn = dataTable(selector,{
		"pageLength": options.pageLength || 50,
		url : options.url
	});
}