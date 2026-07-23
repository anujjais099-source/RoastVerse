export const LEVELS = ["Mild 🙂", "Medium 😏", "Savage 😈"];
export const RELATIONS = ["Friend", "Sibling", "Coworker", "Roommate", "Ex", "Cousin"];

export const LOCAL_ROASTS = {
  Mild: [
    "{name} isn't slow, they're just savoring every second of being wrong first.",
    "As a {relation}, {name} brings the same energy as a phone at 1% — technically still working, barely.",
    "{name}'s life motto is 'close enough', and honestly, bhai, it shows.",
    "{name} has main character energy in a story nobody asked to read.",
    "Being {name}'s {relation} means signing up for chaos with a smile attached.",
  ],
  Medium: [
    "{name}'s decision-making skills peaked the day they were born and it's been downhill since, yaar.",
    "As a {relation}, {name} is proof that confidence and competence don't always travel together.",
    "{name} treats deadlines like suggestions and suggestions like personal attacks.",
    "If overthinking burned calories, {name} would have a six-pack by now, bas.",
    "{name}'s WiFi isn't the only thing running on 2G — the brain's keeping pace too.",
  ],
  Savage: [
    "{name} is the human version of a buffering icon — always loading, never arriving.",
    "As a {relation}, {name} peaked in a group chat screenshot nobody saved.",
    "{name}'s vibe is 'main character' but the plot forgot to show up, bhai.",
    "God said 'let there be sense' and {name} said 'abhi bhi nahi, thanks'.",
    "{name} argues with the confidence of someone who's never once been right, yaar.",
  ],
};

export const getLocalRoast = (name, relation, level, excludeTemplate) => {
  const key = level.split(" ")[0];
  const bank = LOCAL_ROASTS[key] || LOCAL_ROASTS.Medium;
  const pool = excludeTemplate && bank.length > 1 ? bank.filter((t) => t !== excludeTemplate) : bank;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { text: pick.replaceAll("{name}", name).replaceAll("{relation}", relation.toLowerCase()), template: pick };
};
