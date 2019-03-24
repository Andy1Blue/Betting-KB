export default function showDate(milis) {
  const date =  new Date(milis);
  return date.toLocaleString();
}
