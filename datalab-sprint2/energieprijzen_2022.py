"""
Verloop van de gemiddelde variabele leveringstarieven voor consumenten in 2022.
Bron: CBS StatLine, tabel 84672NED "Gemiddelde energietarieven voor consumenten, 2018-2023".
Tarieven zijn de gemiddelde variabele leveringstarieven voor nieuwe contracten, inclusief btw.
Let op: vanaf november 2022 gebruikt het CBS een nieuwe meetmethode.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

maanden = ["jan", "feb", "mrt", "apr", "mei", "jun",
           "jul", "aug", "sep", "okt", "nov", "dec"]
gas  = [1.1956, 1.1247, 1.8451, 1.6844, 1.4220, 1.2181,
        1.5908, 2.1147, 2.7706, 2.7830, 1.8201, 1.8201]   # euro per m3
elek = [0.3169, 0.2966, 0.4814, 0.4363, 0.3613, 0.3342,
        0.4187, 0.5028, 0.6439, 0.6588, 0.5266, 0.5200]   # euro per kWh

df = pd.DataFrame({"maand": maanden, "gas_eur_m3": gas, "elektriciteit_eur_kwh": elek})
df.to_csv("energietarieven_2022.csv", index=False)
print(df.to_string(index=False))

BLAUW, ORANJE, INKT, GRIJS = "#2a78d6", "#eb6834", "#0b0b0b", "#52514e"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7.2, 6.4), sharex=True)
fig.patch.set_facecolor("white")

def paneel(ax, waarden, kleur, titel, eenheid, fmt):
    ax.plot(maanden, waarden, color=kleur, linewidth=2, marker="o",
            markersize=5, markerfacecolor=kleur, markeredgecolor="white", markeredgewidth=1.5)
    ax.set_title(titel, loc="left", fontsize=11, fontweight="bold", color=INKT, pad=8)
    ax.set_ylabel(eenheid, color=GRIJS)
    ax.grid(axis="y", color="#e6e6e3", linewidth=0.8)
    for kant in ("top", "right", "left"):
        ax.spines[kant].set_visible(False)
    ax.spines["bottom"].set_color("#c9c9c5")
    ax.tick_params(colors=GRIJS, length=0)
    ax.set_ylim(0, max(waarden) * 1.25)
    # Selectieve directe labels: begin, piek en eind
    piek = max(range(12), key=lambda i: waarden[i])
    for i in (0, piek, 11):
        ax.annotate(fmt.format(waarden[i]).replace(".", ","), (i, waarden[i]),
                    textcoords="offset points", xytext=(0, 9), ha="center",
                    fontsize=9, color=INKT)

paneel(ax1, gas, BLAUW, "Gas: variabel leveringstarief (incl. btw)", "euro per m³", "€ {:.2f}")
paneel(ax2, elek, ORANJE, "Elektriciteit: variabel leveringstarief (incl. btw)", "euro per kWh", "€ {:.3f}")

# Gebeurtenissen die de schommelingen verklaren
for ax in (ax1, ax2):
    ax.axvline(1.75, color="#c9c9c5", linewidth=1, linestyle=(0, (3, 3)))   # 24 feb: inval
    ax.axvline(6.0, color="#c9c9c5", linewidth=1, linestyle=(0, (3, 3)))    # 1 jul: btw 9%
ax1.text(1.85, ax1.get_ylim()[1] * 0.93, "24 feb: Russische inval", fontsize=8, color=GRIJS)
ax1.text(6.1, ax1.get_ylim()[1] * 0.93, "1 jul: btw 21% → 9%", fontsize=8, color=GRIJS)
ax2.set_xlabel("2022", color=GRIJS)

fig.suptitle("Energietarieven voor consumenten per maand, 2022", x=0.02, ha="left",
             fontsize=13, fontweight="bold", color=INKT)
fig.text(0.02, 0.012, "Bron: CBS StatLine, tabel 84672NED (gemiddelde tarieven van nieuwe variabele contracten, incl. btw).\n"
         "Vanaf november 2022 gebruikt het CBS een nieuwe meetmethode.", fontsize=7.5, color=GRIJS, va="bottom")
fig.tight_layout(rect=(0, 0.05, 1, 0.96))
fig.savefig("figuur1_energietarieven_2022.png", dpi=220)
print("opgeslagen: figuur1_energietarieven_2022.png")
