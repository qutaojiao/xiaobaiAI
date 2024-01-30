// bootstrap tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip({
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>'
      });
})

function updateValue(value,idNum) {
    // document.getElementById('rangeValue').textContent = '当前值: ' + value;
    console.log(value)
    $(this).val(value);
    $(`#inputValue${idNum}`).val(value);
}

function updateRange(value,idNum) {
    // document.getElementById('rangeValue').textContent = '当前值: ' + value;
    // console.log(value)
    // $(this).val(value);
    $(`#formControlRange${idNum}`).val(value);
}

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有下拉菜单组
    var dropdowns = document.querySelectorAll('.btn-group.dropup');
    var currentOpenDropdownMenu = null;

    // 为每个下拉菜单添加事件监听器
    dropdowns.forEach(function(dropdown) {
        var dropdownToggle = dropdown.querySelector('[data-toggle="dropdown"]');
        var dropdownMenu = dropdown.querySelector('.dropdown-menu');

        // 确保元素存在后再添加事件监听器
        if (dropdownToggle && dropdownMenu) {
            // 监听下拉按钮的点击事件
            dropdownToggle.addEventListener('click', function(event) {
                event.stopPropagation();

                // 关闭之前的下拉菜单（如果有的话）
                if (currentOpenDropdownMenu && currentOpenDropdownMenu !== dropdownMenu) {
                    currentOpenDropdownMenu.classList.remove('show');
                }

                // 切换当前下拉菜单的显示状态
                dropdownMenu.classList.toggle('show');

                // 更新当前打开的下拉菜单
                currentOpenDropdownMenu = dropdownMenu.classList.contains('show') ? dropdownMenu : null;
            });

            // 阻止点击下拉菜单内部时关闭
            dropdownMenu.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    // 点击文档其他地方时，关闭所有下拉菜单
    document.addEventListener('click', function(event) {
        if (currentOpenDropdownMenu) {
            currentOpenDropdownMenu.classList.remove('show');
            currentOpenDropdownMenu = null;
        }
    });
});



// 上传文件
$("#uploadFile").click(function () {
    $("#fileInput").click();
});

$("#fileInput").change(function () {
    var fileName = $(this).val().split('\\').pop();
    $("#filesList").append('<li class="list-group-item">' + fileName + '</li>');
});