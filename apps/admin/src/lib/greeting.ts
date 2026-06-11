export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let salutation = "Good evening";

  if (hour < 12) salutation = "Good morning";
  else if (hour < 18) salutation = "Good afternoon";

  return name ? `${salutation}, ${name}` : salutation;
}
