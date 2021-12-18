function fetchDataTable(selector, options) {
	tableTxn = $(selector).removeAttr("width").DataTable({
		"pageLength": options.pageLength || 50,
		searching : options.searching || false,
		ajax : options.url,
		responsive: true,
	});
}