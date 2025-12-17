import { Template } from './types';

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Dual Y-Axis Time Series',
    description: 'A professional dual-axis plot suitable for comparing variables with different scales over time. Features clear legends and grid lines.',
    imageUrl: 'https://picsum.photos/seed/plot1/800/600',
    language: 'python',
    tags: ['Time Series', 'Dual Axis', 'Matplotlib'],
    code: `import matplotlib.pyplot as plt
import numpy as np

# Generate data
t = np.arange(0.0, 10.0, 0.01)
s1 = np.sin(2 * np.pi * t)
s2 = np.exp(-t)

fig, ax1 = plt.subplots(figsize=(10, 6))

color = 'tab:red'
ax1.set_xlabel('time (s)')
ax1.set_ylabel('exp', color=color)
ax1.plot(t, s2, color=color)
ax1.tick_params(axis='y', labelcolor=color)

ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis

color = 'tab:blue'
ax2.set_ylabel('sin', color=color)
ax2.plot(t, s1, color=color)
ax2.tick_params(axis='y', labelcolor=color)

fig.tight_layout()
plt.title("Dual Y-Axis Comparison")
plt.show()`,
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'Violin Plot Distribution',
    description: 'Ideal for visualizing the distribution of data and its probability density. Useful for comparing multiple groups.',
    imageUrl: 'https://picsum.photos/seed/plot2/800/600',
    language: 'python',
    tags: ['Statistics', 'Distribution', 'Seaborn'],
    code: `import seaborn as sns
import matplotlib.pyplot as plt

# Load the example dataset
df = sns.load_dataset("tips")

plt.figure(figsize=(10, 6))
sns.violinplot(x="day", y="total_bill", hue="smoker",
               data=df, palette="muted", split=True)

plt.title("Distribution of Total Bill by Day")
plt.grid(True, alpha=0.3)
plt.show()`,
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    title: '3D Surface Plot',
    description: 'A 3D surface plot for visualizing mathematical functions or terrain data. Includes a color bar for depth perception.',
    imageUrl: 'https://picsum.photos/seed/plot3/800/600',
    language: 'python',
    tags: ['3D', 'Surface', 'Matplotlib'],
    code: `import matplotlib.pyplot as plt
import numpy as np
from matplotlib import cm

fig, ax = plt.subplots(subplot_kw={"projection": "3d"}, figsize=(10, 8))

# Make data.
X = np.arange(-5, 5, 0.25)
Y = np.arange(-5, 5, 0.25)
X, Y = np.meshgrid(X, Y)
R = np.sqrt(X**2 + Y**2)
Z = np.sin(R)

# Plot the surface.
surf = ax.plot_surface(X, Y, Z, cmap=cm.coolwarm,
                       linewidth=0, antialiased=False)

# Add a color bar which maps values to colors.
fig.colorbar(surf, shrink=0.5, aspect=5)

plt.title("3D Surface Plot Example")
plt.show()`,
    createdAt: Date.now() - 200000
  }
];
