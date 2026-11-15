function openRequestModal(planName, planPrice){
document.getElementById('modalPlanName').innerText = planName;
document.getElementById('modalPlanPrice').innerText = planPrice;
document.getElementById('hiddenPlanName').value = planName;
document.getElementById('hiddenPlanPrice').value = planPrice;
var base = document.getElementById('requestForm').getAttribute('data-subject') || 'Nueva Solicitud';
document.getElementById('emailSubject').value = base + ': ' + planName + ' - GlacierArt';
document.getElementById('formError').classList.remove('active');
document.getElementById('requestModal').classList.add('active');
}

function closeModal(modalId){
document.getElementById(modalId).classList.remove('active');
}

function handleFormSubmit(event){
event.preventDefault();
var form = event.target;
var formData = new FormData(form);
var submitBtn = document.getElementById('submitBtn');
var errorText = document.getElementById('formError');

errorText.classList.remove('active');
submitBtn.disabled = true;
submitBtn.innerText = 'Enviando...';

fetch(form.action, {
method: 'POST',
body: formData,
headers: {'Accept': 'application/json'}
}).then(function(response){
if(!response.ok){ throw new Error('Respuesta no valida del servidor: ' + response.status); }
return response.json();
}).then(function(){
submitBtn.disabled = false;
submitBtn.innerText = 'Enviar Solicitud';
closeModal('requestModal');
form.reset();
document.getElementById('successModal').classList.add('active');
}).catch(function(error){
console.error('Error al enviar el formulario:', error);
submitBtn.disabled = false;
submitBtn.innerText = 'Enviar Solicitud';
errorText.classList.add('active');
});
}
